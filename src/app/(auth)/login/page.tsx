'use client';

import React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLogin } from '@/features/auth/hooks';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Video } from 'lucide-react';

const loginSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters' }),
  password: z.string().min(5, { message: 'Password must be at least 5 characters' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { mutate: login, isPending, error } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    login(data);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden bg-radial-gradient">
      {/* Dynamic background decoration */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 -translate-x-1/2 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand heading */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-tr from-purple-600 to-indigo-600 p-3.5 rounded-2xl text-white shadow-xl shadow-purple-500/10 mb-4">
            <Video className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">Welcome back</h2>
          <p className="text-sm text-zinc-400 mt-2">Enter credentials to access your editor console</p>
        </div>

        {/* Login Card */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md rounded-2xl p-8 shadow-xl shadow-black/40">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Username"
              placeholder="e.g. video_creator"
              error={errors.username?.message}
              disabled={isPending}
              {...register('username')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              disabled={isPending}
              {...register('password')}
            />

            {error && (
              <div className="text-xs bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg font-medium">
                Invalid credentials. Please verify username and password.
              </div>
            )}

            <Button type="submit" variant="primary" className="w-full" isLoading={isPending}>
              Sign In to Workspace
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-zinc-400 border-t border-zinc-800/80 pt-6">
            New to Shortify AI?{' '}
            <Link href="/register" className="text-purple-400 hover:text-purple-300 font-semibold hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
