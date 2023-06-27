import { PortfolioScope, scopeToInterval, spotPerScope } from '~/main-page/Portfolio';
import { AssetSpot } from './portfolio';

interface TransposeResponse {
	results: AssetSpot[] | null;
	error: boolean;
	error_code: number;
	error_message: string;
}

const query = `
WITH
    transfers AS (
      /*-- ERC-20 inflows*/
        SELECT
            TIMESTAMP,
            contract_address,
            SUM(quantity) quantity
        FROM
            ethereum.token_transfers
        WHERE
            to_address = \'{{wallet}}\'
            AND __confirmed = TRUE
        GROUP BY
            TIMESTAMP,
            contract_address
        UNION ALL
      /*-- ERC-20 outflows*/
        SELECT
            TIMESTAMP,
            contract_address,
            SUM(- quantity) quantity
        FROM
            ethereum.token_transfers
        WHERE
            from_address = \'{{wallet}}\'
            AND __confirmed = TRUE
        GROUP BY
            TIMESTAMP,
            contract_address
        UNION ALL
      /*-- ETH inflows*/
        SELECT
            TIMESTAMP,
            \'0x0000000000000000000000000000000000000000\' AS contract_address,
            SUM(quantity) quantity
        FROM
            ethereum.native_token_transfers
        WHERE
            to_address = \'{{wallet}}\'
            AND __confirmed = TRUE
        GROUP BY
            TIMESTAMP,
            contract_address
        UNION ALL
      /*-- ETH outflows*/
        SELECT
            TIMESTAMP,
            \'0x0000000000000000000000000000000000000000\' AS contract_address,
            SUM(- quantity) quantity
        FROM
            ethereum.native_token_transfers
        WHERE
            from_address = \'{{wallet}}\'
            AND __confirmed = TRUE
        GROUP BY
            TIMESTAMP,
            contract_address
    ),
  /*-- Create a table of balances over time by accumulating transfers*/
    balances AS (
        SELECT
            contract_address AS token_address,
            TIMESTAMP AS TIMESTAMP,
            SUM(quantity) OVER (
                PARTITION BY
                    contract_address
                ORDER BY
                    TIMESTAMP
            ) AS balance
        FROM
            transfers
    ),
  /*-- Create a table of tokens (including metadata)*/
    tokens AS (
        SELECT
            dt.token_address,
            et.decimals,
            et.symbol,
            et.name,
            et.description,
            et.external_url,
            et.image_url
        FROM
            (
                SELECT DISTINCT
                    token_address
                FROM
                    balances
            ) dt
            JOIN ethereum.tokens et ON et.contract_address = dt.token_address
            AND et.verified = TRUE
        UNION
      /*-- Add a hardcoded row for ETH*/
        SELECT
            \'0x0000000000000000000000000000000000000000\' AS token_address,
            18 AS decimals,
            \'ETH\' AS symbol,
            \'Ethereum\' AS NAME,
            \'Ethereum is a decentralized, open-source blockchain with smart contract functionality.\' AS description,
            \'https://ethereum.org\' AS external_url,
            \'https://ethereum.org/favicon-32x32.png\' AS image_url
    ),
  /*-- Create a time series to sample balances and prices at regular intervals*/
    series AS (
        SELECT
            GENERATE_SERIES(
                NOW(),
                NOW() - INTERVAL \'{{interval}}\',
                INTERVAL \'-{{interval}}\' / \'{{samples}}\'
            ) AS TIMESTAMP
    )
  /*-- Compute the balance and price at each point in the time series for each token*/
SELECT
    \'{{wallet}}\' AS OWNER,
    tokens.token_address,
    tokens.symbol,
    tokens.name,
    tokens.description,
    tokens.external_url,
    tokens.image_url,
    tokens.decimals,
    series.timestamp,
    (
        SELECT
            balance
        FROM
            balances b
        WHERE
            b.token_address = tokens.token_address
            AND b.timestamp <= series.timestamp
        ORDER BY
            b.timestamp DESC
        LIMIT
            1
    ) / POWER(10, tokens.decimals) AS balance,
    (
        SELECT
            price
        FROM
            ethereum.token_prices etp
        WHERE
            etp.token_address = tokens.token_address
            AND etp.timestamp <= series.timestamp
        ORDER BY
            etp.timestamp DESC
        LIMIT
            1
    ) AS price,
    COALESCE(
        (
            (
                SELECT
                    price
                FROM
                    ethereum.token_prices etp
                WHERE
                    etp.token_address = tokens.token_address
                    AND etp.timestamp <= series.timestamp
                ORDER BY
                    etp.timestamp DESC
                LIMIT
                    1
            ) * (
                SELECT
                    balance
                FROM
                    balances b
                WHERE
                    b.token_address = tokens.token_address
                    AND b.timestamp <= series.timestamp
                ORDER BY
                    b.timestamp DESC
                LIMIT
                    1
            )
        ) / POWER(10, tokens.decimals),
        0
    ) AS VALUE
FROM
    tokens
    CROSS JOIN series
  /*-- Filter out rows representing the zero address with no description (i.e., placeholder rows)*/
WHERE
    NOT (
        tokens.token_address = \'0x0000000000000000000000000000000000000000\'
        AND tokens.description IS NULL
    )
`;

export const getSpotsForAddressWithScope = async (
	address: string,
	scope: PortfolioScope
): Promise<AssetSpot[]> => {
	return fetch('https://api.transpose.io/sql', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-API-KEY': import.meta.env.VITE_TRANSPOSE_API_KEY
		},
		body: JSON.stringify({
			sql: query,
			parameters: {
				wallet: address,
				interval: scopeToInterval(scope),
				samples: spotPerScope(scope)
			},
			options: {}
		})
	})
		.then((res) => {
			return res.json() as Promise<TransposeResponse>;
		})
		.then((res) => {
			console.log(res);
			if (res.error) {
				throw new Error(res.error_message);
			}
			if (!res.results) {
				throw new Error('No data');
			}
			return res.results.map((spot) => {
				return {
					...spot,
					for_scope: scope
				};
			});
		})
		.catch((err) => {
			console.error(err);
			return [] as AssetSpot[];
		});
};
