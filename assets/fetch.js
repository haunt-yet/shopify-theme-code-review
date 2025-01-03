const mallDomain = "/apps/mall";
// const mallDomain = "http://localhost:8888/api"; // 開発時検証用

async function fetchBase(url, func, method = 'GET', data = null) {
  try {
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }

    const res = await fetch(url, options);
    if (!res.ok) {
      throw new Error("データの取得に失敗しました");
    }
    const responseData = await res.json();

    func(responseData);
  } catch (error) {
    console.error("エラーです:", error);
  }
}