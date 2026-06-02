// A股智析 PWA Service Worker
const CACHE_NAME = 'stockrsi-v1.0.0';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './pc.png',
  './app.png',
  'https://cdn.jsdelivr.net/npm/sortablejs@1.15.1/Sortable.min.js'
];

// 安装阶段 - 缓存资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] 开始缓存资源');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        console.log('[SW] 资源缓存完成');
        return self.skipWaiting();
      })
      .catch((err) => {
        console.error('[SW] 缓存失败:', err);
      })
  );
});

// 激活阶段 - 清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] 删除旧缓存:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] 激活成功');
        return self.clients.claim();
      })
  );
});

// 拦截请求 - 缓存优先策略（仅缓存静态资源，跳过API）
self.addEventListener('fetch', (event) => {
  // 跳过非GET请求
  if (event.request.method !== 'GET') return;
  
  // 跳过 chrome-extension 和其他非HTTP请求
  if (!event.request.url.startsWith('http')) return;

  // 跳过API请求（东方财富股票数据接口），不缓存以保证数据实时性
  if (event.request.url.includes('eastmoney.com')) {
    return; // 不拦截，走浏览器默认网络请求
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // 返回缓存，同时更新缓存（后台更新）
          event.waitUntil(
            fetch(event.request)
              .then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                  caches.open(CACHE_NAME)
                    .then((cache) => cache.put(event.request, networkResponse.clone()));
                }
              })
              .catch(() => {})
          );
          return cachedResponse;
        }
        
        // 缓存中没有，请求网络
        return fetch(event.request)
          .then((networkResponse) => {
            // 如果请求成功，缓存响应
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => cache.put(event.request, responseClone));
            }
            return networkResponse;
          })
          .catch(() => {
            // 网络不可用时返回离线提示（仅对HTML请求）
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('./index.html');
            }
          });
      })
  );
});

// 处理来自页面的消息
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
