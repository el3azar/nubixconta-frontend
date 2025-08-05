import axios from "axios";

export const assignUserToCompany = async (companyId, userId) => {
  try {
    const token = sessionStorage.getItem("nubix_token");

    const response = await axios.patch(
      `http://localhost:8080/api/v1/companies/${companyId}`,
      {
        userId: userId,
        companyStatus: true,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error asignando usuario a empresa:", error);
    if (error.response) {
    console.error("STATUS:", error.response.status);
    console.error("DATA:", error.response.data);
  }
    throw error;
  }
};
