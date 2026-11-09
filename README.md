# Project 8: L'Oréal Chatbot

L’Oréal is exploring the power of AI, and your job is to showcase what's possible. Your task is to build a chatbot that helps users discover and understand L’Oréal’s extensive range of products—makeup, skincare, haircare, and fragrances—as well as provide personalized routines and recommendations.

## 🚀 Launch via GitHub Codespaces

1. In the GitHub repo, click the **Code** button and select **Open with Codespaces → New codespace**.
2. Once your codespace is ready, open the `index.html` file via the live preview.

## ☁️ Connect the chatbot securely

1. Use the class-hosted Cloudflare Worker URL provided by your instructor. If it is not included in your course materials, ask your instructor for it.
2. Paste that URL into the `workerUrl` value near the top of `script.js`.
3. Open `index.html` in the live preview and ask a beauty-related question.

The page sends a `messages` array to the Worker and reads the reply from `data.choices[0].message.content`. Conversation history is kept in the current browser tab and sent with each question. The Worker securely holds the API key; never request, create, or store a key in this project, including in a `secrets.js` file.

Enjoy building your L’Oréal beauty assistant! 💄
