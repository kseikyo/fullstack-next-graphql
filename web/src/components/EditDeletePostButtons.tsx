import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { IconButton, Link } from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";
import { useDeletePostMutation, useMeQuery } from "../generated/graphql";

interface EditDeletePostButtons {
  id: number;
  title: string;
  creatorId: number;
}

const EditDeletePostButtons: React.FC<EditDeletePostButtons> = ({
  id,
  title,
  creatorId,
}) => {
  const [{ data }] = useMeQuery();
  const [, deletePost] = useDeletePostMutation();

  if (data?.me?.id !== creatorId) {
    return null;
  }
  return (
    <>
      <NextLink href="/post/edit/[id]" as={`/post/edit/${id}`}>
        <IconButton
          as={Link}
          mr={4}
          aria-label={`Edit post ${title}`}
          icon={<EditIcon />}
        />
      </NextLink>
      <IconButton
        aria-label={`delete post ${title}`}
        icon={<DeleteIcon />}
        onClick={() => {
          deletePost({ id });
        }}
      />
    </>
  );
};

export default EditDeletePostButtons;
