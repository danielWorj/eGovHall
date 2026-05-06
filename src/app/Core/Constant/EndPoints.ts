const baseUrl = 'http://localhost:8080/eHall/api';

const authBaseUrl = `${baseUrl}/auth`;

export const eHAllSystemEndPoints ={
    Auth : {
        login : `${authBaseUrl}/login`
    }
}