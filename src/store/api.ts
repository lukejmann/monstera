import { PortfolioScope, scopeToInterval, spotPerScope } from '~/main-page/Portfolio';
import { AssetSpot } from './portfolio';

interface TransposeResponse {
	results: AssetSpot[] | null;
	error: boolean;
	error_code: number;
	error_message: string;
}

export const getSpotsForAddressWithSpot = async (
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
			sql: `
			WITH
transfers AS (
/* ERC-20 inflows */
SELECT timestamp, contract_address, sum(quantity) quantity
FROM ethereum.token_transfers
WHERE to_address = '{{wallet}}'
AND __confirmed = true
GROUP BY timestamp, contract_address
/* ERC-20 outflows */
UNION ALL
SELECT timestamp, contract_address, sum(-quantity) quantity
FROM ethereum.token_transfers
WHERE from_address = '{{wallet}}'
AND __confirmed = true
GROUP BY timestamp, contract_address
/* ETH inflows */
UNION ALL
SELECT timestamp, '0x0000000000000000000000000000000000000000' AS contract_address, sum(quantity) quantity
FROM ethereum.native_token_transfers
WHERE to_address = '{{wallet}}'
AND __confirmed = true
GROUP BY timestamp, contract_address
/* ETH outflows */
UNION ALL
SELECT timestamp, '0x0000000000000000000000000000000000000000' AS contract_address, sum(-quantity) quantity
FROM ethereum.native_token_transfers
WHERE from_address = '{{wallet}}'
AND __confirmed = true
GROUP BY timestamp, contract_address),

/* partition over historical quantity to generate a cumulative sum */
balances AS (
SELECT
    contract_address AS token_address, 
    timestamp AS timestamp,
    SUM(quantity) OVER (PARTITION BY contract_address ORDER BY timestamp) AS balance
FROM transfers),

tokens AS (
SELECT dt.token_address, et.decimals, et.symbol, et.name, et.description, et.external_url, et.image_url
FROM (SELECT DISTINCT token_address FROM balances) dt
JOIN ethereum.tokens et ON et.contract_address = dt.token_address AND et.verified = true
UNION SELECT '0x0000000000000000000000000000000000000000' AS token_address, 18 AS decimals, 'ETH' as symbol, 'Ethereum' as name, 'Ethereum is a decentralized, open-source blockchain with smart contract functionality.' as description, 'https://ethereum.org' as external_url, 'https://ethereum.org/favicon-32x32.png' as image_url),

/* negative interval so that rounding error doesn't show up at NOW */
series AS (
SELECT GENERATE_SERIES(NOW(), NOW() - INTERVAL '{{interval}}', INTERVAL '-{{interval}}' / '{{samples}}') as timestamp)

/* we take price * balance for each timestamp/token pair and do not aggregate by timestamp */
SELECT
    '{{wallet}}' AS owner,
    tokens.token_address,
    tokens.symbol,
    tokens.name,
    tokens.description,
    tokens.external_url,
    tokens.image_url,
    tokens.decimals,
    series.timestamp,
    (SELECT balance FROM balances b WHERE b.token_address = tokens.token_address AND b.timestamp <= series.timestamp ORDER BY b.timestamp DESC LIMIT 1) / POWER(10, tokens.decimals) AS balance,
    (SELECT price FROM ethereum.token_prices etp WHERE etp.token_address = tokens.token_address AND etp.timestamp <= series.timestamp ORDER BY etp.timestamp DESC LIMIT 1) AS price,
    COALESCE(
        ((SELECT price FROM ethereum.token_prices etp
        WHERE etp.token_address = tokens.token_address
        AND etp.timestamp <= series.timestamp
        ORDER BY etp.timestamp DESC LIMIT 1)
        *
        (SELECT balance FROM balances b
        WHERE b.token_address = tokens.token_address
        AND b.timestamp <= series.timestamp
        ORDER BY b.timestamp DESC LIMIT 1))
        /
        POWER(10, tokens.decimals)
    , 0) AS value
FROM tokens
CROSS JOIN series
`,
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
