export default function HomePage() {
  return null;
}

export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/landing.html',
      permanent: false,
    },
  };
}
