export const endpointsCodes = (error, dispatch, setState) => {
    if (error.code === "ERR_NETWORK") {
      dispatch(
        setState({
          code: 500,
          msg: "internal server error",
          state: true,
        })
      );
    } else {
      switch (error.response.status) {
        case 400: {
          dispatch(
            setState({
              code: 400,
              msg: error.response.data.msg,
              state: true,
            })
          );
          break;
        }
        case 401: {
          dispatch(
            setState({
              code: 401,
              msg: error.response.statusText,
              state: true,
            })
          );
          break;
        }
        case 404: {
          dispatch(
            setState({
              code: 404,
              msg: error.response.statusText,
              state: true,
            })
          );
          break;
        }
        case 500: {
          dispatch(
            setState({
              code: 500,
              msg: "internal server error",
              state: true,
            })
          );
          break;
        }
      }
    }
  };