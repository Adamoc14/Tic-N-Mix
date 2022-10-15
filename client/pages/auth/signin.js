// Import and Package Declarations
import { useState } from "react";
import Router from 'next/router';
import useRequest from "../../hooks/use-request";

// Sign In Form
const SignIn = () => {
  // Variables for component
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { doRequest , errors } = useRequest({
    url: '/api/users/signin',
    method: 'post',
    body: {
        email, 
        password
    },
    onSuccess: () => Router.push('/')
  })

  // Function Definitions
  const onSubmit = async event => {

    // Preventing default behaviour
    event.preventDefault();

    // Call Hook to make Sign In Request
    doRequest();    
  }

  return (
    <form onSubmit={onSubmit}>
      <h1>Sign In</h1>
      <div className="form-group">
        <label>Email Address</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target?.value)}
          type="text"
          className="form-control"
        />
      </div>
      <div className="form-group">
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target?.value)}
          className="form-control"
        />
      </div>
      <br></br>
      { errors }
      <button className="btn btn-primary">Sign In</button>
    </form>
  );
};

// Export
export default SignIn;
