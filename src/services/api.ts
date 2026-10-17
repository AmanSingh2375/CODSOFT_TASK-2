const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('dinedesk_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('dinedesk_token', token);
}

export function clearAuthToken() {
  localStorage.removeItem('dinedesk_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.error || data?.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Auth
  auth: {
    login: (credentials: { email: string; password: string }) =>
      request<{ token: string; user: any; message: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    register: (userData: { name: string; email: string; phone?: string; password: string; role?: string }) =>
      request<{ token: string; user: any; message: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    getMe: () => request<any>('/auth/me'),
    updateProfile: (profile: { name?: string; phone?: string; avatar?: string }) =>
      request<{ message: string; user: any }>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profile),
      }),
  },

  // Menu
  menu: {
    getItems: (params?: { search?: string; category?: string; isVeg?: string; isAvailable?: string; sortBy?: string }) => {
      const q = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          if (v !== undefined && v !== '') q.append(k, v);
        });
      }
      return request<any[]>(`/menu?${q.toString()}`);
    },
    getCategories: () => request<any[]>('/menu/categories'),
    getItem: (id: number) => request<any>(`/menu/${id}`),
    createItem: (data: any) =>
      request<any>('/menu', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateItem: (id: number, data: any) =>
      request<any>(`/menu/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    deleteItem: (id: number) =>
      request<{ message: string }>(`/menu/${id}`, {
        method: 'DELETE',
      }),
  },

  // Orders
  orders: {
    getAll: (params?: { status?: string; limit?: number; email?: string }) => {
      const q = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          if (v !== undefined && v !== '') q.append(k, String(v));
        });
      }
      return request<any[]>(`/orders?${q.toString()}`);
    },
    getById: (id: number) => request<any>(`/orders/${id}`),
    create: (orderData: any) =>
      request<{ message: string; order: any }>('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      }),
    updateStatus: (id: number, data: { status?: string; paymentStatus?: string }) =>
      request<{ message: string; order: any }>(`/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  // Tables
  tables: {
    getAll: (params?: { date?: string; timeSlot?: string }) => {
      const q = new URLSearchParams();
      if (params?.date) q.append('date', params.date);
      if (params?.timeSlot) q.append('timeSlot', params.timeSlot);
      return request<any[]>(`/tables?${q.toString()}`);
    },
    create: (data: any) =>
      request<any>('/tables', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: any) =>
      request<any>(`/tables/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<{ message: string }>(`/tables/${id}`, {
        method: 'DELETE',
      }),
  },

  // Reservations
  reservations: {
    getAll: (params?: { email?: string }) => {
      const q = new URLSearchParams();
      if (params?.email) q.append('email', params.email);
      return request<any[]>(`/reservations?${q.toString()}`);
    },
    create: (data: any) =>
      request<{ message: string; reservation: any }>('/reservations', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateStatus: (id: number, status: string) =>
      request<{ message: string; reservation: any }>(`/reservations/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),
  },

  // Coupons
  coupons: {
    getAll: () => request<any[]>('/coupons'),
    apply: (data: { code: string; subtotal: number }) =>
      request<{
        valid: boolean;
        code: string;
        discountAmount: number;
        description: string;
        discountType: string;
        discountValue: number;
      }>('/coupons/apply', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    create: (data: any) =>
      request<any>('/coupons', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: any) =>
      request<any>(`/coupons/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<{ message: string }>(`/coupons/${id}`, {
        method: 'DELETE',
      }),
  },

  // Payments
  payments: {
    create: (data: { orderId: number; amount: number; method?: string }) =>
      request<any>('/payments/create', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    verify: (data: {
      orderId: number;
      razorpayPaymentId?: string;
      razorpayOrderId?: string;
      razorpaySignature?: string;
      paymentMethod?: string;
    }) =>
      request<{ success: boolean; message: string; payment: any; order: any }>('/payments/verify', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Dashboard & Admin
  dashboard: {
    getStats: () => request<any>('/dashboard/stats'),
    getUsers: () => request<any[]>('/admin/users'),
    updateUserRole: (id: number, role: string) =>
      request<{ message: string; user: any }>(`/admin/users/${id}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
      }),
  },
};
