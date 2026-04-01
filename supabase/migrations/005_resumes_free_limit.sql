-- Free users: max 1 resume (Pro/Lifetime unlimited)

drop policy if exists "Users can insert own resumes" on public.resumes;

create policy "Users can insert own resumes"
  on public.resumes for insert
  with check (
    auth.uid() = user_id
    and (
      exists (
        select 1
        from public.profiles p
        where p.id = auth.uid()
          and p.plan in ('pro', 'lifetime')
      )
      or (
        select count(*)::int
        from public.resumes r
        where r.user_id = auth.uid()
      ) < 1
    )
  );
