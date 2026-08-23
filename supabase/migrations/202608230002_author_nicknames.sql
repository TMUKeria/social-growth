-- 이메일 대신 공개 화면에 표시할 교사 닉네임을 추가합니다.
begin;

alter table public.profiles
  add column nickname text
  check (nickname is null or char_length(trim(nickname)) between 2 and 30);

alter table public.scenarios
  add column author_name text not null default '이름 미설정'
  check (char_length(trim(author_name)) between 2 and 30);

commit;
