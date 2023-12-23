import axios from "axios";


export const setupAxiosInterceptors = (navigate) => {
    axios.interceptors.request.use(
      (config) => {
        const token =  localStorage.getItem("JWT_TOKEN")
        if (config.headers)
          (config.headers).set("Authorization", `Bearer ${token}`)
        return config;
      },
      (error) => Promise.reject(error)
    )
    axios.interceptors.response.use(
      (response) => {
        return response;
      }, 
      (error) => {
        if (error.response.status === 401) {
          navigate("/signin")
        } else {
          return Promise.reject(error);
        }
      }
    )  
  };