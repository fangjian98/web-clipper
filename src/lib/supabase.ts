import { createClient } from '@supabase/supabase-js';

// Supabase 配置
// 请替换为您的实际 Supabase 项目 URL 和 anon key
// 可以从 Supabase 项目的设置 > API 中获取
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// 判断是否配置了Supabase
const isSupabaseConfigured = supabaseUrl.includes('supabase.co') && supabaseAnonKey.length > 10;

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// 历史记录类型
export interface ClipHistory {
  id: string;
  url: string;
  title: string;
  content: string;
  created_at: string;
}

// 本地存储后备方案
const LOCAL_STORAGE_KEY = 'web_clipper_history';

function getLocalHistory(): ClipHistory[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function setLocalHistory(history: ClipHistory[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(history));
  } catch {
    // ignore
  }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 创建历史记录
export async function createHistoryRecord(url: string, title: string, content: string): Promise<ClipHistory | null> {
  const record: ClipHistory = {
    id: generateId(),
    url,
    title,
    content,
    created_at: new Date().toISOString(),
  };

  // 优先使用Supabase
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('clip_history')
        .insert([{ url, title, content }])
        .select()
        .single();
      
      if (error) {
        console.warn('Supabase error, falling back to local storage:', error.message);
        // 降级到本地存储
        const history = getLocalHistory();
        history.unshift(record);
        setLocalHistory(history);
        return record;
      }
      return data;
    } catch (e) {
      console.warn('Supabase error, falling back to local storage');
    }
  }

  // 本地存储后备
  const history = getLocalHistory();
  history.unshift(record);
  setLocalHistory(history);
  return record;
}

// 获取历史记录列表
export async function getHistoryList(limit: number = 20): Promise<ClipHistory[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('clip_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.warn('Supabase error, falling back to local storage:', error.message);
        return getLocalHistory().slice(0, limit);
      }
      return data || [];
    } catch {
      console.warn('Supabase error, falling back to local storage');
    }
  }

  // 本地存储后备
  return getLocalHistory().slice(0, limit);
}

// 删除历史记录
export async function deleteHistoryRecord(id: string): Promise<boolean> {
  if (supabase) {
    try {
      const { error } = await supabase
        .from('clip_history')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.warn('Supabase error, falling back to local storage:', error.message);
      }
    } catch {
      console.warn('Supabase error, falling back to local storage');
    }
  }

  // 本地存储后备
  const history = getLocalHistory();
  const filtered = history.filter(item => item.id !== id);
  setLocalHistory(filtered);
  return true;
}

// 检查Supabase是否已配置
export function isConfigured(): boolean {
  return isSupabaseConfigured;
}
