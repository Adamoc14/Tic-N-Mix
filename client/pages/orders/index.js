// Imports and Package Declarations

// Component Declaration
const Orders = ({orders}) => {
    return (
        <>
            <h1>Orders</h1>
            <ul>
                { orders?.map(order => {
                    return (
                        <li key={order?.id}>
                            <h3>{order?.ticket?.title}</h3>
                            <h3>Status: {order?.status}</h3>
                        </li>
                    )
                }) }
            </ul>
        </>
    );
}

Orders.getInitialProps = async(context , client) => {
    const {data:orders} = await client?.get('/api/orders');

    return {
        orders
    }
}

// Exports
export default Orders