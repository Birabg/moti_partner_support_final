// frontend/src/api/roleApi.js

import Axios from "./axios";

export const RoleApi = {

    assign(data){

        return Axios.post(
            "/roles/assign",
            data
        );

    },


    revoke(data){

        return Axios.post(
            "/roles/revoke",
            data
        );

    }

};