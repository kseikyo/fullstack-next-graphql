import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Flex, IconButton, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import {
  PostSnippetFragment,
  useMeQuery,
  useVoteMutation,
} from "../generated/graphql";
import { isServer } from "../utils/isServer";

interface UpdootSectionProps {
  post: PostSnippetFragment;
}

export const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
  const [{ data }] = useMeQuery({
    pause: isServer(), // Disables server side rendering when fetching this query
  });

  const disableUpdoot = !!data?.me?.id && post.voteStatus === 1;
  const disableDowndoot = !!data?.me?.id && post.voteStatus === -1;

  const [loadingState, setLoadingState] = useState<
    "updoot-loading" | "downdoot-loading" | "not-loading"
  >("not-loading");
  const [, vote] = useVoteMutation();

  return (
    <Flex
      alignItems="center"
      justifyContent="center"
      flexDir="column"
      style={{ gap: ".5rem" }}
    >
      <IconButton
        aria-label="upvote post"
        icon={<ChevronUpIcon boxSize={6} />}
        onClick={async () => {
          setLoadingState("updoot-loading");
          await vote({ value: 1, postId: post.id });
          setLoadingState("not-loading");
        }}
        disabled={disableUpdoot}
        isLoading={loadingState === "updoot-loading"}
        colorScheme="teal"
        variant="link"
      />
      <Text fontSize="lg">{post.points}</Text>
      <IconButton
        aria-label="downvote post"
        icon={<ChevronDownIcon boxSize={6} />}
        onClick={async () => {
          setLoadingState("downdoot-loading");
          await vote({ value: -1, postId: post.id });
          setLoadingState("not-loading");
        }}
        disabled={disableDowndoot}
        isLoading={loadingState === "downdoot-loading"}
        colorScheme="teal"
        variant="link"
      />
    </Flex>
  );
};
