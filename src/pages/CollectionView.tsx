
import React from 'react';
import { useParams } from 'react-router-dom';
import CollectionDetail from '@/components/collections/CollectionDetail';
import SharedCollectionView from '@/components/collections/SharedCollectionView';
import Navbar from '@/components/Navbar';

const CollectionView = () => {
  const { id, shareId } = useParams();
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {!shareId && <Navbar />}
      {shareId ? (
        <SharedCollectionView />
      ) : (
        <div className="container mx-auto py-8 px-4">
          <CollectionDetail />
        </div>
      )}
    </div>
  );
};

export default CollectionView;
