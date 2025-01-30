import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Subject } from '../types';
import * as Icons from 'lucide-react';

interface SubjectCardProps {
  subject: Subject;
  delay: number;
}

export default function SubjectCard({ subject, delay }: SubjectCardProps) {
  const IconComponent = (Icons as any)[subject.icon] || Icons.BookOpen;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      <Link to={`/subjects/${subject.id}`} className="block p-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <IconComponent className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{subject.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{subject.description}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}