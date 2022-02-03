import type { LoaderFunction } from 'remix';
import { Link, useLoaderData } from 'remix';
import type { Joke, User } from '@prisma/client';
import { db } from '~/utils/db.server';

type LoaderData = {
  joke: Joke;
  user: User;
};

export const loader: LoaderFunction = async ({
  params,
}) => {
  const joke = await db.joke.findUnique({
    where: { id: params.jokeId },
  });
  if (!joke) throw new Error('Joke not found');

  const user = await db.user.findUnique({
    where: { id: joke.jokesterId },
  });
  if (!user) {
    throw new Error(
        'Joke is not formed correctly, there is no user who wrote it',
    );
  }

  const data: LoaderData = { joke, user };
  return data;
};

export default function JokeRoute() {
  const data = useLoaderData<LoaderData>();

  return (
    <div>
      <p>Her&apos;s your hilarious joke:</p>
      <p>{data.joke.content}</p>
      <p>Written By: {data.user.username}</p>
      <Link to=".">&quot;{data.joke.name}&quot; Permalink</Link>
    </div>
  );
}
