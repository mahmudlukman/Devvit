'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { Textarea } from '../ui/textarea';
import { useState } from 'react';
import { ProfileSchema } from '@/lib/validations';
import { redirect, usePathname, useRouter } from 'next/navigation';
import { useUpdateUserProfileMutation } from '@/redux/features/user/userApi';

interface User {
  name: string;
  username: string;
  bio: string;
  avatar?: string; 
  portfolioWebsite: string;
  location: string;
}

interface Props {
  user: User;
}

const Profile = ({ user }: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [updateUserProfile] = useUpdateUserProfileMutation();
  const [avatarPreview, setAvatarPreview] = useState(user.avatar || '');

  const form = useForm<z.infer<typeof ProfileSchema>>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      name: user.name || '',
      username: user.username || '',
      portfolioWebsite: user.portfolioWebsite || '',
      location: user.location || '',
      bio: user.bio || '',
      avatar: user.avatar || '',
    },
  });

  async function onSubmit(values: z.infer<typeof ProfileSchema>) {
    setIsSubmitting(true);

    try {
      await updateUserProfile({
        data: {
          name: values.name,
          username: values.username,
          portfolioWebsite: values.portfolioWebsite,
          location: values.location,
          bio: values.bio,
          avatar: values.avatar,
        },
        path: pathname,
      });

      router.back();
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        form.setValue('avatar', result); // Set avatar as base64 string
        setAvatarPreview(result); // Update preview with base64 string
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mt-9 flex w-full flex-col gap-9"
      >
        <FormField
          control={form.control}
          name="avatar"
          render={({ field }) => (
            <FormItem className="space-y-3.5">
              <FormLabel className="paragraph-semibold text-dark400_light800">
                Avatar
              </FormLabel>
              <FormControl>
                <>
                  <input
                    type="file"
                    name="avatar"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="no-focus light-border-2 background-light800_dark300 min-h-[56px] border"
                  />
                  <FormMessage />
                </>
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="space-y-3.5">
              <FormLabel className="paragraph-semibold text-dark400_light800">
                Name
              </FormLabel>
              <FormControl>
                <>
                  <Input
                    placeholder="Name"
                    className="no-focus light-border-2 background-light800_dark300 min-h-[56px] border"
                    {...field}
                  />
                  <FormMessage />
                </>
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem className="space-y-3.5">
              <FormLabel className="paragraph-semibold text-dark400_light800">
                Username
              </FormLabel>
              <FormControl>
                <>
                  <Input
                    placeholder="Username"
                    className="no-focus light-border-2 background-light800_dark300 min-h-[56px] border"
                    {...field}
                  />
                  <FormMessage />
                </>
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="portfolioWebsite"
          render={({ field }) => (
            <FormItem className="space-y-3.5">
              <FormLabel className="paragraph-semibold text-dark400_light800">
                Portfolio Website
              </FormLabel>
              <FormControl>
                <>
                  <Input
                    placeholder="Portfolio Website"
                    className="no-focus light-border-2 background-light800_dark300 min-h-[56px] border"
                    {...field}
                  />
                  <FormMessage />
                </>
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem className="space-y-3.5">
              <FormLabel className="paragraph-semibold text-dark400_light800">
                Location
              </FormLabel>
              <FormControl>
                <>
                  <Input
                    placeholder="Location"
                    className="no-focus light-border-2 background-light800_dark300 min-h-[56px] border"
                    {...field}
                  />
                  <FormMessage />
                </>
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem className="space-y-3.5">
              <FormLabel className="paragraph-semibold text-dark400_light800">
                Bio
              </FormLabel>
              <FormControl>
                <>
                  <Textarea
                    placeholder="Bio"
                    className="no-focus light-border-2 background-light800_dark300 min-h-[120px] border"
                    {...field}
                  />
                  <FormMessage />
                </>
              </FormControl>
            </FormItem>
          )}
        />

        <div className="mt-7 flex justify-end">
          <Button
            type="submit"
            className="primary-gradient w-fit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default Profile;
