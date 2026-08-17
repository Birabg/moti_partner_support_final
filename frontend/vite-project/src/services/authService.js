import Axios from "../api/axios";


export const authService={


    login(data){

        return Axios.post(

            "/auth/login",
            data

        ).then((res)=>{

            if(res.data.accessToken){

                localStorage.setItem(

                    "jwt_token",
                    res.data.accessToken

                );

            }

            return res.data;

        });

    },


    logout(){

        localStorage.removeItem(

            "jwt_token"

        );

        return Axios.post(

            "/auth/logout"

        );

    },


    me(){

        return Axios.get(

            "/auth/me"

        );

    }


}