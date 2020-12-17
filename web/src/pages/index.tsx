import { withUrqlClient } from "next-urql";
import { Container } from "../components/Container";
import { NavBar } from "../components/NavBar";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
const Index = () => {
  const [{ data }] = usePostsQuery({
    variables: {
      limit: 10
    }
  });
  return (
    <Container height="100vh">
      <NavBar />
      {!data
        ? <div>loading...</div>
        : data.posts.map((post) => {
            return <div key={post.id}>{post.title}</div>;
          })}
    </Container>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
