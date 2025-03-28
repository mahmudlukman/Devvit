'use client';

import { useDeleteAnswerMutation } from '@/redux/features/answer/answerApi';
import { useDeleteQuestionMutation } from '@/redux/features/question/questionApi';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Props {
  type: string;
  itemId: string;
}

const EditDeleteAction = ({ type, itemId }: Props) => {
  const pathname = usePathname();
  const router = useRouter();
  const [deleteAnswer] = useDeleteAnswerMutation({});
  const [deleteQuestion] = useDeleteQuestionMutation({});

  const handleEdit = () => {
    router.push(`/question/edit/${JSON.parse(itemId)}`);
  };

  const handleDelete = async () => {
    if (type === 'Question') {
      // Delete question
      await deleteQuestion({
        questionId: JSON.parse(itemId),
        path: pathname,
      });
      toast.success('Question Deleted Successfully');
    } else if (type === 'Answer') {
      // Delete answer
      await deleteAnswer({
        answerId: JSON.parse(itemId),
        path: pathname,
      });
      toast.success('Answer Deleted Successfully');
    }
  };

  return (
    <div className="flex items-center justify-end gap-3 max-sm:w-full">
      {type === 'Question' && (
        <Image
          src="/assets/icons/edit.svg"
          alt="Edit"
          width={14}
          height={14}
          className="cursor-pointer object-contain"
          onClick={handleEdit}
        />
      )}

      <Image
        src="/assets/icons/trash.svg"
        alt="Delete"
        width={14}
        height={14}
        className="cursor-pointer object-contain"
        onClick={handleDelete}
      />
    </div>
  );
};

export default EditDeleteAction;
