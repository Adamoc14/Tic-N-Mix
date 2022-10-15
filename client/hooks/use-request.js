// Imports and Package Declarations
import axios from "axios";
import { useState } from "react";

// Custom Use Request Hook
export default ({ url, method, body , onSuccess }) => {
  // Variables for process
  const [errors, setErrors] = useState(null);
  const doRequest = async (props = {}) => {
    try {

      // Clear out errors at start
      setErrors(null);

      // Send Request to Auth Service w/ valid credentials (ie. email, password)
      const { data } = await axios[method](url, {...body, ...props});

      // Redirect to appropriate page
      if (onSuccess) onSuccess(data);

      return data;


    } catch (error) {
      // Obtain errors from response
      const {
        response: {
          data: { errors },
        },
      } = error;

      setErrors(
        <div className="alert alert-danger">
          <h4>Oops...</h4>
          <ul className="my-0">
            { errors?.map(({ message }) => {
              return <li key={ message }>{message}</li>;
            })}
          </ul>
        </div>
      );
    }
  };

  return { doRequest, errors };
};
