// Imports and Package Declarations
import Link from 'next/link'


const Landing = ({currentUser , tickets}) => {

    // Fill table with tickets
    const ticketList = tickets.map(ticket => {
        return (
            <tr key={ticket?.id}>
                <td>{ticket?.title}</td>
                <td>€{ticket?.price?.toFixed(2)}</td>
                <td>
                    <Link href={`/tickets/${ticket?.id}`}>
                        View
                    </Link>
                </td>
            </tr>
        );
    })
    
    return (
        <div>
            <h1>Tickets</h1>
            <table className="table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Price</th>
                    </tr>
                </thead>
                <tbody>
                    { ticketList }
                </tbody>
            </table>
        </div>
    );
}

Landing.getInitialProps = async(context , client , currentUser) => {
    const { data:tickets } = await client.get('/api/tickets')
    return { tickets }
}

export default Landing