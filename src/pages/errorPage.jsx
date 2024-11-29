import { Button, Result } from "antd";
import { Link, useRouteError } from "react-router-dom";

const ErrorPage = () => {
  const error = useRouteError();
  console.error(error);

  return (
    <div id="error-page">
      <Result
        status="500"
        title="Oops!"
        subTitle="Sorry, an unexpected error has occurred."
        extra={
          <Button type="primary">
            <Link to="/">Back Home</Link>
          </Button>
        }
      >
        <div style={{ color: "red" }}>
          <i>{error.statusText || error.message}</i>
        </div>
      </Result>
    </div>
  );
};

export default ErrorPage;
