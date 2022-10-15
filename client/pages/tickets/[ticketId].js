// Imports and Package Declarations
import useRequest from "../../hooks/use-request";

// Component Declaration
const TicketShow = ({ ticket }) => {
  // Property Declarations
  const { doRequest, errors } = useRequest({
    url: "/api/orders",
    method: "post",
    body: {
      ticketId: ticket?.id,
    },
    onSuccess: (order) =>
      Router.push("/orders/[orderId]", `/orders/${order?.id}`),
  });

  return (
    <div>
      <h1>{ticket?.title}</h1>
      <h4>Price: {ticket?.price}</h4>
      {errors}
      <button onClick={() => doRequest()} className="btn btn-primary">
        Purchase
      </button>
    </div>
  );
};

TicketShow.getInitialProps = async (context, client) => {
  const { ticketId } = context?.query;
  const { data: ticketData } = await client.get(`/api/tickets/${ticketId}`);

  return {
    ticket: ticketData,
  };
};

// Exports
export default TicketShow;
