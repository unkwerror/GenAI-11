import axios, { AxiosInstance } from 'axios';

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

interface User {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
  created_at: string;
}

interface Event {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  color: string;
  source: string;
  reminder_enabled: boolean;
  reminder_time: number;
  reminder_type: string;
  tags?: string;
  created_at: string;
  updated_at: string;
}

interface Todo {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  completed: boolean;
  priority: string;
  category: string;
  due_date?: string;
  tags?: string;
  created_at: string;
  updated_at: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export type EventSource = 'local' | 'google' | 'yandex';
export type ReminderType = 'notification' | 'email' | 'both';

export interface CreateEventPayload {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  color?: string;
  source?: EventSource;
  reminder_enabled?: boolean;
  reminder_time?: number;
  reminder_type?: ReminderType;
  tags?: string;
}

export type UpdateEventPayload = Partial<CreateEventPayload>;

export interface CreateTodoPayload {
  title: string;
  description?: string;
  completed?: boolean;
  priority?: string;
  category?: string;
  due_date?: string | null;
  tags?: string;
}

export type UpdateTodoPayload = Partial<CreateTodoPayload>;

class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Загружаем токены из localStorage при инициализации
    this.accessToken = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');

    // Interceptor для добавления токена в заголовки
    this.client.interceptors.request.use((config) => {
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });

    // Interceptor для обработки 401 ошибок
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            await this.refreshAccessToken();
            return this.client(originalRequest);
          } catch (refreshError) {
            this.logout();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // ==================== Auth Methods ====================

  async register(email: string, username: string, password: string): Promise<User> {
    const response = await this.client.post<User>('/auth/register', {
      email,
      username,
      password,
    });
    return response.data;
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await this.client.post<LoginResponse>('/auth/login', {
      email,
      password,
    });

    const { access_token, refresh_token } = response.data;
    this.accessToken = access_token;
    this.refreshToken = refresh_token;

    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);

    return response.data;
  }

  async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await this.client.post<LoginResponse>('/auth/refresh', null, {
        headers: {
          Authorization: `Bearer ${this.refreshToken}`,
        },
      });

      this.accessToken = response.data.access_token;
      localStorage.setItem('access_token', this.accessToken);
    } catch (error) {
      this.logout();
      throw error;
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.client.get<User>('/auth/me');
    return response.data;
  }

  logout(): void {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  // ==================== Events Methods ====================

  async getEvents(): Promise<Event[]> {
    const response = await this.client.get<Event[]>('/events');
    return response.data;
  }

  async getEvent(id: number): Promise<Event> {
    const response = await this.client.get<Event>(`/events/${id}`);
    return response.data;
  }

  async createEvent(event: CreateEventPayload): Promise<Event> {
    const response = await this.client.post<Event>('/events', event);
    return response.data;
  }

  async updateEvent(
    id: number,
    event: UpdateEventPayload
  ): Promise<Event> {
    const response = await this.client.put<Event>(`/events/${id}`, event);
    return response.data;
  }

  async deleteEvent(id: number): Promise<void> {
    await this.client.delete(`/events/${id}`);
  }

  // ==================== Todos Methods ====================

  async getTodos(): Promise<Todo[]> {
    const response = await this.client.get<Todo[]>('/todos');
    return response.data;
  }

  async getTodo(id: number): Promise<Todo> {
    const response = await this.client.get<Todo>(`/todos/${id}`);
    return response.data;
  }

  async createTodo(todo: CreateTodoPayload): Promise<Todo> {
    const response = await this.client.post<Todo>('/todos', todo);
    return response.data;
  }

  async updateTodo(
    id: number,
    todo: UpdateTodoPayload
  ): Promise<Todo> {
    const response = await this.client.put<Todo>(`/todos/${id}`, todo);
    return response.data;
  }

  async deleteTodo(id: number): Promise<void> {
    await this.client.delete(`/todos/${id}`);
  }

  // ==================== Utility Methods ====================

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }
}

export const apiClient = new ApiClient();
export type {
  User,
  Event,
  Todo,
  LoginResponse,
  CreateEventPayload,
  UpdateEventPayload,
  CreateTodoPayload,
  UpdateTodoPayload
};
