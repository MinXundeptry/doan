# NutriNote web app

## Chạy ứng dụng

```sh
npm install
npm run dev
```

Mặc định ứng dụng gọi backend tại `http://localhost:5000/api/v1`. Để đổi địa
chỉ, tạo file `.env` trong thư mục này theo mẫu `.env.example` rồi đặt
`VITE_API_URL` thành URL API mong muốn.

Tạo bản build production bằng `npm run build`.

## Tính năng người dùng và quản trị

- Người dùng xem lượng calo đã nạp ở `/diary` và ghi hoạt động tại `/activity`.
  Calo vận động là số ước tính theo MET, thời lượng và cân nặng trong hồ sơ.
- Quản trị viên mở `/admin` để xem thống kê hệ thống, quản lý tài khoản và
  danh mục thực phẩm.
- Với database đã tồn tại, chạy lần lượt ba file migration trong
  `../docs/migrations/` trước khi khởi động backend.
