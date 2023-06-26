import { createBrowserRouter } from 'react-router-dom';
import { Interface, appRoutes } from './router';

const router = createBrowserRouter(appRoutes);

function App() {
	return (
		<div>
			<Interface router={router} />
		</div>
	);
}

export default App;
