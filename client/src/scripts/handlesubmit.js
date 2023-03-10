export const submitFormData = async (formData) => {
  // commit to database
  const response = await fetch(
    process.env.REACT_APP_BACKEND_ENDPOINT + "/api/submission",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ formData }),
    }
  );
  return await response.json();
};

export const updateFormData = async (formData, id) => {
  // commit to database
  const response = await fetch(
    process.env.REACT_APP_BACKEND_ENDPOINT + "/api/update",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ formData, id }),
    }
  );
  return await response.json();
};
