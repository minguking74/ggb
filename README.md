# 간단 가계부

Supabase(Postgres) 데이터베이스를 사용하는 가계부 웹앱입니다.
별도 빌드 과정 없이 `index.html`만 열면 바로 사용할 수 있습니다.

## 기능
- 수입/지출 내역 추가 (날짜, 카테고리, 금액, 메모)
- 월별 보기 (이전/다음 달 이동)
- 월별 수입/지출/잔액 요약
- 내역 삭제
- 데이터는 Supabase `transactions` 테이블에 저장됨 (기기 간 동기화 가능)

## 사용법
`index.html` 파일을 브라우저로 열기만 하면 됩니다.

```bash
start index.html
```

## 파일 구조
- `index.html` - 마크업
- `style.css` - 스타일
- `app.js` - 로직 (Vanilla JS, Supabase JS 클라이언트 사용)
- `config.js` - Supabase 프로젝트 URL / anon 키

## Supabase 설정
- `transactions` 테이블: `id, type, date, category, amount, memo, created_at`
- Row Level Security 활성화, `anon` 역할에 대해 전체 CRUD를 허용하는 정책 적용
- 로그인 기능이 없는 개인용 앱이므로 anon 키만으로 테이블에 접근 가능합니다.
  여러 명이 접근하거나 민감한 데이터를 다룬다면 Supabase Auth 도입을 고려하세요.
