import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Header from '@/components/shared/Header';
import TransformationForm from '@/components/shared/TransformationForm';
import { transformationTypes } from '@/constants';
import { getUserById } from '@/lib/actions/user.action';
import { getImageById } from '@/lib/actions/image.actions';
interface PropsPrams {
  params: Promise<{ id: string; type: TransformationTypeKey }>;
}
const Page = async ({ params }: PropsPrams) => {
  const { userId } = await auth();
  const reslovePrams = await params;
  if (!userId) redirect('/sign-in');

  const user = await getUserById(userId);
  const image = await getImageById(reslovePrams.id);

  const transformation =
    transformationTypes[image.transformationType as TransformationTypeKey];

  return (
    <>
      <Header title={transformation.title} subtitle={transformation.subTitle} />

      <section className="mt-10">
        <TransformationForm
          action="Update"
          userId={user._id}
          type={image.transformationType as TransformationTypeKey}
          creditBalance={user.creditBalance}
          config={image.config}
          data={image}
        />
      </section>
    </>
  );
};

export default Page;
