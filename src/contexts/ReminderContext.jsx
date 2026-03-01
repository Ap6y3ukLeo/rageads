import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

const ReminderContext = createContext();

export const useReminders = () => useContext(ReminderContext);

export const ReminderProvider = ({ children }) => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  
  const isInitialMount = useRef(true);

  // 1. Инициализация - загрузка напоминаний при старте
  const initializeReminders = async (currentUser) => {
    if (currentUser) {
      setUser(currentUser);
      await loadRemindersFromSupabase(currentUser.id);
    }
    setLoading(false);
  };

  // 2. Загрузка напоминаний из Supabase
  const loadRemindersFromSupabase = async (userId = null) => {
    setLoading(true); // Начинаем загрузку
    try {
      let query = supabase
        .from('reminders')
        .select('*');
      
      // Если есть userId, фильтруем по пользователю
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      const { data, error } = await query
        .order('reminder_date', { ascending: true })
        .order('reminder_time', { ascending: true });

      if (error) {
        console.error('Supabase error:', error);
        // Пробуем получить все напоминания без фильтра
        const { data: allData, error: allError } = await supabase
          .from('reminders')
          .select('*')
          .order('reminder_date', { ascending: true });
        
        if (allError) {
          console.error('Error loading all reminders:', allError);
          setReminders([]);
          setLoading(false);
          return;
        }
        setReminders(formatReminders(allData || []));
        setLoading(false);
        return;
      }

      setReminders(formatReminders(data || []));
      console.log('✅ Загружено напоминаний:', data?.length || 0);
    } catch (error) {
      console.error('❌ Ошибка загрузки напоминаний:', error.message);
      setReminders([]);
    } finally {
      setLoading(false); // Завершаем загрузку
    }
  };

  // Вспомогательная функция для форматирования
  const formatReminders = (data) => {
    return data.map(r => ({
      id: r.id,
      supabaseId: r.id,
      title: r.title,
      reminderDate: r.reminder_date,
      reminderTime: r.reminder_time,
      createdAt: new Date(r.created_at),
      lastReminderSent: r.last_reminder_sent ? new Date(r.last_reminder_sent) : null,
      reminderStage: r.reminder_stage || 0,
      extendedCount: r.extended_count || 0,
      telegramChatId: r.telegram_chat_id,
      userId: r.user_id
    }));
  };

  // 3. Создание напоминания
  const addReminder = async (reminderData) => {
    // Не требуем авторизацию - создаем напоминание без user_id
    try {
      // Убираем секунды из времени если есть
      const timeValue = reminderData.reminderTime ? 
        (reminderData.reminderTime.includes(':') ? 
          reminderData.reminderTime.split(':').slice(0,2).join(':') : 
          reminderData.reminderTime) : '09:00';
      
      const reminderPayload = {
        user_id: user?.id || null,
        title: reminderData.title,
        reminder_date: reminderData.reminderDate,
        reminder_time: timeValue,
        telegram_chat_id: reminderData.telegramChatId || null,
        reminder_stage: 0,
        extended_count: 0
      };

      const { data, error } = await supabase
        .from('reminders')
        .insert([reminderPayload])
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }

      const newReminder = {
        id: data.id,
        supabaseId: data.id,
        title: data.title,
        reminderDate: data.reminder_date,
        reminderTime: data.reminder_time,
        createdAt: new Date(data.created_at),
        lastReminderSent: null,
        reminderStage: 0,
        extendedCount: 0,
        telegramChatId: data.telegram_chat_id
      };

      setReminders(prev => [...prev, newReminder].sort((a, b) => {
        const dateA = new Date(`${a.reminderDate} ${a.reminderTime}`);
        const dateB = new Date(`${b.reminderDate} ${b.reminderTime}`);
        return dateA - dateB;
      }));

      console.log('✅ Напоминание создано:', data.id);
      return data.id;
    } catch (error) {
      console.error('❌ Ошибка создания напоминания:', error.message);
      return null;
    }
  };

  // 4. Обновление напоминания
  const updateReminder = async (id, updates) => {
    const reminderToUpdate = reminders.find(r => r.id === id);
    if (!reminderToUpdate) return;

    try {
      const updatePayload = {};
      if (updates.title) updatePayload.title = updates.title;
      if (updates.reminderDate) updatePayload.reminder_date = updates.reminderDate;
      if (updates.reminderTime) updatePayload.reminder_time = updates.reminderTime;
      if (updates.reminderStage !== undefined) updatePayload.reminder_stage = updates.reminderStage;
      if (updates.extendedCount !== undefined) updatePayload.extended_count = updates.extendedCount;
      if (updates.lastReminderSent) updatePayload.last_reminder_sent = updates.lastReminderSent.toISOString();

      const { error } = await supabase
        .from('reminders')
        .update(updatePayload)
        .eq('id', reminderToUpdate.supabaseId);

      if (error) throw error;

      setReminders(prev => prev.map(r =>
        r.id === id ? { ...r, ...updates } : r
      ));

      console.log('✅ Напоминание обновлено:', id);
    } catch (error) {
      console.error('❌ Ошибка обновления напоминания:', error.message);
    }
  };

  // 5. Удаление напоминания
  const deleteReminder = async (id) => {
    const reminderToDelete = reminders.find(r => r.id === id);
    if (!reminderToDelete) return;

    try {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', reminderToDelete.supabaseId);

      if (error) throw error;

      setReminders(prev => prev.filter(r => r.id !== id));
      console.log('✅ Напоминание удалено:', id);
    } catch (error) {
      console.error('❌ Ошибка удаления напоминания:', error.message);
    }
  };

  // 6. Продление напоминания
  const extendReminder = async (id, newDate, newTime) => {
    await updateReminder(id, {
      reminderDate: newDate,
      reminderTime: newTime,
      extendedCount: (reminders.find(r => r.id === id)?.extendedCount || 0) + 1
    });
  };

  // Получить напоминания на сегодня
  const getTodayReminders = () => {
    const today = new Date().toISOString().split('T')[0];
    return reminders.filter(r => r.reminderDate === today);
  };

  // Получить будущие напоминания
  const getUpcomingReminders = () => {
    const today = new Date().toISOString().split('T')[0];
    return reminders.filter(r => r.reminderDate >= today);
  };

  // Получить просроченные напоминания
  const getOverdueReminders = () => {
    const today = new Date().toISOString().split('T')[0];
    return reminders.filter(r => r.reminderDate < today);
  };

  const value = {
    reminders,
    loading,
    user,
    initializeReminders,
    addReminder,
    updateReminder,
    deleteReminder,
    extendReminder,
    getTodayReminders,
    getUpcomingReminders,
    getOverdueReminders,
    loadRemindersFromSupabase
  };

  return (
    <ReminderContext.Provider value={value}>
      {children}
    </ReminderContext.Provider>
  );
};
