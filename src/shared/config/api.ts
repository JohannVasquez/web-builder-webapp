export const getApiBaseUrl = (): string => {
  return (
    process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'
  );
};

export const getPublicApiBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
};
