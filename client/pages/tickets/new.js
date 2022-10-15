// Imports and Package Declarations
import { useState } from "react";
import useRequest from "../../hooks/use-request";
import Router from 'next/router'


// Variable Declarations
const NewTicket = () => {
  // Property Declarations
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState('');
  const {doRequest , errors} = useRequest({
    url: '/api/tickets',
    method: 'post',
    body: {
        title,
        price: parseFloat(price)
    },
    onSuccess: () => Router.push('/')
  })

  // Methods
  const onSubmit = event => {
    event.preventDefault()
    doRequest();
  };

  const onBlur = () => {
    const priceVal = parseFloat(price)

    if(isNaN(priceVal)) return

    setPrice(priceVal.toFixed(2))
  }

  return (
    <div>
      <h1>Create a ticket</h1>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e?.target?.value)}
            className="form-control"
            type="text"
          />
        </div>
        <div className="form-group">
          <label htmlFor="">Price</label>
          <input
            value={price}
            onBlur = {onBlur}
            onChange={(e) => setPrice(e?.target?.value)}
            className="form-control"
            type="text"
          />
        </div>
        { errors }
        <button className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
};

NewTicket.getInitialProps = (client, currentUser) => {};

// Exports
export default NewTicket;
