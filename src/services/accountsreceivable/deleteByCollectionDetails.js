import axios from "axios";
const API_URL = "http://localhost:8080/api/v1/collection-detail";

export const deleteCollectionDetail = async (id)=>{
    try{
        const token = sessionStorage.getItem("nubix_token");
        const response = await axios.delete(`${API_URL}/${id}`,{
            headers:{
                Authorization: `Bearer ${token}`
            },
            withCredentials:true,
        });
        return response.data;
    }catch(error){
        console.log(`Error al eliminar collection detail con id ${id}`,error);
        throw error;
    }
}