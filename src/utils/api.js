const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    const err = new Error(error.error || `HTTP error! status: ${response.status}`);
    err.status = response.status;
    err.data = error;
    throw err;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

export const api = {
  // Workers
  getWorkers: async () => {
    const response = await fetch(`${API_BASE_URL}/workers`);
    return handleResponse(response);
  },

  createWorker: async (data) => {
    const response = await fetch(`${API_BASE_URL}/workers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  updateWorker: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/workers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  deleteWorker: async (id) => {
    const response = await fetch(`${API_BASE_URL}/workers/${id}`, {
      method: "DELETE",
    });
    return handleResponse(response);
  },

  // Boxes
  getBoxes: async () => {
    const response = await fetch(`${API_BASE_URL}/boxes`);
    return handleResponse(response);
  },

  createBox: async (data) => {
    const response = await fetch(`${API_BASE_URL}/boxes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  updateBox: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/boxes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  deleteBox: async (id) => {
    const response = await fetch(`${API_BASE_URL}/boxes/${id}`, {
      method: "DELETE",
    });
    return handleResponse(response);
  },

  // Services
  getServices: async () => {
    const response = await fetch(`${API_BASE_URL}/services`);
    return handleResponse(response);
  },

  createService: async (data) => {
    const response = await fetch(`${API_BASE_URL}/services`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: data.title,
        price: data.price,
        percent: data.percent,
        dateISO: data.dateISO,
        workerIds: data.workerIds,
      }),
    });
    return handleResponse(response);
  },

  updateService: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/services/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: data.title,
        price: data.price,
        percent: data.percent,
        dateISO: data.dateISO,
        workerIds: data.workerIds,
      }),
    });
    return handleResponse(response);
  },

  deleteService: async (id) => {
    const response = await fetch(`${API_BASE_URL}/services/${id}`, {
      method: "DELETE",
    });
    return handleResponse(response);
  },

  // Bookings
  getBookings: async (date) => {
    const url = date ? `${API_BASE_URL}/bookings?date=${date}` : `${API_BASE_URL}/bookings`;
    const response = await fetch(url);
    return handleResponse(response);
  },

  createBooking: async (data) => {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client: data.client,
        car: data.car,
        service: data.service,
        datetime: data.datetime,
        durationMinutes: data.durationMinutes,
        price: data.price,
        workers: data.workers,
        boxId: data.boxId,
        salaryPercent: data.salaryPercent,
      }),
    });
    return handleResponse(response);
  },

  updateBooking: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client: data.client,
        car: data.car,
        service: data.service,
        datetime: data.datetime,
        durationMinutes: data.durationMinutes,
        price: data.price,
        workers: data.workers,
        boxId: data.boxId,
        salaryPercent: data.salaryPercent,
      }),
    });
    return handleResponse(response);
  },

  deleteBooking: async (id) => {
    const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
      method: "DELETE",
    });
    return handleResponse(response);
  },

  // Settings
  getSettings: async () => {
    const response = await fetch(`${API_BASE_URL}/settings`);
    return handleResponse(response);
  },

  updateSettings: async (data) => {
    const response = await fetch(`${API_BASE_URL}/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
};

