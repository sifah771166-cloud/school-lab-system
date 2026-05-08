const prisma = require('../../utils/prisma');

exports.requestLoan = async (userId, data) => {
  // Check item exists and quantity available (simplified)
  const item = await prisma.item.findUnique({ where: { id: data.itemId } });
  if (!item) throw new Error('Item not found');
  // Optional: check quantity vs existing loans that are not returned
  return prisma.loan.create({
    data: {
      userId,
      itemId: data.itemId,
      quantity: data.quantity,
      requestNote: data.requestNote,
      dueDate: data.dueDate,
      status: 'pending',
    },
  });
};

exports.approveLoan = async (loanId, status, approverId, rejectionReason) => {
  const loan = await prisma.loan.findUnique({
    where: { id: loanId },
    include: { item: { include: { lab: true } } },
  });
  if (!loan) throw new Error('Loan not found');
  // Check if approver has right to manage loans in that lab's department
  const user = await prisma.user.findUnique({ where: { id: approverId } });
  if (user.role !== 'SUPER_ADMIN' && loan.item.lab.departmentId !== user.departmentId) {
    throw new Error('Access denied');
  }
  if (loan.status !== 'pending') throw new Error('Loan is not in pending state');

  return prisma.loan.update({
    where: { id: loanId },
    data: {
      status,
      approvedBy: approverId,
      approvedAt: new Date(),
      ...(status === 'rejected' && { rejectionReason }),
    },
  });
};

exports.returnLoan = async (loanId, userId) => {
  const loan = await prisma.loan.findUnique({ where: { id: loanId } });
  if (!loan) throw new Error('Loan not found');
  if (loan.userId !== userId) throw new Error('You can only return your own loans');
  if (loan.status !== 'approved') throw new Error('Loan must be approved before return');
  return prisma.loan.update({
    where: { id: loanId },
    data: { status: 'returned', returnedAt: new Date() },
  });
};

exports.getUserLoans = async (userId) => {
  return prisma.loan.findMany({ where: { userId }, include: { item: true } });
};

exports.getAllLoans = async (user) => {
  if (user.role === 'SUPER_ADMIN') return prisma.loan.findMany({ include: { item: true, user: { select: { id: true, name: true } } } });
  return prisma.loan.findMany({
    where: { item: { lab: { departmentId: user.departmentId } } },
    include: { item: true, user: { select: { id: true, name: true } } },
  });
};