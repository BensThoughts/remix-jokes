import { Link, LoaderFunction } from 'remix';
import { useLoaderData } from 'remix';
import type { Joke, User } from '@prisma/client';
import { db } from '~/utils/db.server';

type LoaderData = {
  randomJoke: Joke;
  user: User | null;
};

export const loader: LoaderFunction = async () => {
  const count = await db.joke.count();
  const randomNumber = Math.floor(Math.random() * count);
  const [randomJoke] = await db.joke.findMany({
    take: 1,
    skip: randomNumber,
  });
  const user = await db.user.findUnique({
    where: { id: randomJoke.jokesterId },
  });

  const data: LoaderData = { randomJoke, user };
  return data;
};

export default function JokesIndexRoute() {
  const data = useLoaderData<LoaderData>();

  return (
    <div>
      <p>Here&apos;s a random joke:</p>
      <p>{data.randomJoke.content}</p>
      {data.user?.username && (
        <p>
          Written By: {data.user.username}
        </p>
      )}
      <Link to={data.randomJoke.id}>
        &quot;{data.randomJoke.name}&quot; Permalink
      </Link>
    </div>
  );
}

export function ErrorBoundary() {
  return (
    <div className="error-container">
      I did a whoopsies.
    </div>
  );
}
