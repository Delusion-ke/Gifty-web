export default function CookiesPage() {
  return null;
}

export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/cookies.html',
      permanent: false,
    },
  };
}
