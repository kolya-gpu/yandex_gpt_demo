const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Конфигурация Yandex GPT API
const YANDEX_GPT_API_URL = 'https://api.fusionbrain.ai/web/api/v1/text/generation';
const YANDEX_GPT_API_KEY = process.env.YANDEX_GPT_API_KEY;

// Обработка чата
app.post('/api/chat', async (req, res) => {
  try {
    const { message, knowledgeBase } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Сообщение обязательно' });
    }

    if (!YANDEX_GPT_API_KEY) {
      return res.status(500).json({ 
        error: 'API ключ Yandex GPT не настроен. Создайте файл .env с YANDEX_GPT_API_KEY' 
      });
    }

    // Формируем промпт с базой знаний
    let prompt = message;
    if (knowledgeBase && knowledgeBase.trim()) {
      prompt = `Контекст: ${knowledgeBase}\n\nВопрос пользователя: ${message}\n\nОтвет на основе предоставленного контекста:`;
    }

    // Отправляем запрос к Yandex GPT API
    const response = await axios.post(YANDEX_GPT_API_URL, {
      type: "GENERATE",
      params: {
        query: prompt,
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 0.9,
        repetition_penalty: 1.1
      }
    }, {
      headers: {
        'Authorization': `Bearer ${YANDEX_GPT_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    // Извлекаем ответ из API
    const aiResponse = response.data.choices?.[0]?.text || 
                      response.data.response || 
                      'Извините, не удалось получить ответ от AI.';

    res.json({ response: aiResponse.trim() });

  } catch (error) {
    console.error('Ошибка при обработке запроса:', error);
    
    if (error.response) {
      console.error('Ответ API:', error.response.data);
      res.status(error.response.status).json({ 
        error: `Ошибка API: ${error.response.data.error || 'Неизвестная ошибка'}` 
      });
    } else {
      res.status(500).json({ 
        error: 'Внутренняя ошибка сервера' 
      });
    }
  }
});

// Проверка здоровья сервера
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`API доступен по адресу: http://localhost:${PORT}`);
  
  if (!YANDEX_GPT_API_KEY) {
    console.warn('⚠️  YANDEX_GPT_API_KEY не настроен в .env файле');
  }
});
