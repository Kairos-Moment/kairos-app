// Created by: Jorge Valdes-Santiago
//
//
// The page that appears to users who are not logged-in

const Login = (props) => {
  // The link tothe server endpoint that handles authentication
  const AUTH_URL = `${props.api_url}/auth/github`;

  return (
    <div className="login-container">
      <center>
        <a href={AUTH_URL}>
          <button className="login-btn">Login via Github </button>
        </a>
      </center>
    </div>
  );
};

export default Login;
