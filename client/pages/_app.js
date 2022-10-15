// Imports and Package Declarations
import 'bootstrap/dist/css/bootstrap.css'
import buildClient from '../api/build-client';
import Header from '../components/header';

// Defining Custom App Component
const AppComponent =  ({Component , pageProps , currentUser}) => {
    return (
        <div>
            <Header currentUser= { currentUser } ></Header>
            <div className='container'>
                <Component currentUser= {currentUser} {...pageProps} />
            </div>
        </div>
    );
}

// Getting initial data for app 
AppComponent.getInitialProps = async({ ctx , Component }) => {
    const client = await buildClient(ctx);
    const { data } = await client.get('/api/users/currentuser');

    // Allowing Execution of getInitialProps from child Page Components
    const pageProps = Component.getInitialProps ? await Component.getInitialProps(ctx, client, data?.currentUser) : {};

    return {
        pageProps,
        ...data
    };

}

// Export
export default AppComponent