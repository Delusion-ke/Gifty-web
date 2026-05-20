export default function TermsPage() {
  return null;
}

export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/terms.html',
      permanent: false,
    },
  };
}
