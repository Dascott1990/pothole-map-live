import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [reports, setReports] = useState([]);
  const [comments, setComments] = useState({});

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    newSocket.on('new_report', (report) => {
      setReports(prev => [report, ...prev]);
    });

    newSocket.on('new_comment', (comment) => {
      setComments(prev => ({
        ...prev,
        [comment.report_id]: [...(prev[comment.report_id] || []), comment]
      }));
    });

    newSocket.on('vote_update', (voteData) => {
      setReports(prev => prev.map(report => 
        report.id === voteData.report_id 
          ? { ...report, upvotes: voteData.upvotes, downvotes: voteData.downvotes }
          : report
      ));
    });

    return () => newSocket.close();
  }, []);

  const value = {
    socket,
    reports,
    setReports,
    comments,
    setComments
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};