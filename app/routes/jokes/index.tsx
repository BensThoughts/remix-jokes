import { Link, LoaderFunction } from 'remix';
import { useLoaderData, useCatch } from 'remix';
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
  if (!randomJoke) {
    throw new Response('No random joke found', {
      status: 404,
    });
  }
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
      <Link prefetch="intent" to={data.randomJoke.id}>
        &quot;{data.randomJoke.name}&quot; Permalink
      </Link>
    </div>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return (
      <div className="error-container">
        There are no jokes to display.
      </div>
    );
  }
  throw new Error(
      `Unexpected caught response with status: ${caught.status}`,
  );
}

export function ErrorBoundary() {
  return (
    <div className="error-container">
      I did a whoopsies.
    </div>
  );
}
