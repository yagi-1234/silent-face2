type PagingProps = {
  totalPages: number
  currentPageNo: number
  onSelectPage: (pageNo: number) => void
}

const PagingControl: React.FC<PagingProps> = ({ totalPages, currentPageNo, onSelectPage }) => {
  const withPage = 2
  return (
    <div className="flex justify-center">
      {Array.from({ length: totalPages }, (_, index) => (
        index === currentPageNo ? (
          <button key={index} className="border border-blue-300 w-10 text-center cursor-pointer font-bold bg-blue-50">
            {index + 1}
          </button>
        ) : 
        index === 0 ||
            ((currentPageNo - (withPage + 1)) < index && index < (currentPageNo + (withPage + 1))) ||
            (index === totalPages - 1) ? (
          <button key={index} className="border border-gray-200 w-10 text-center cursor-pointer"
              onClick={() => onSelectPage(index)}>
            {index + 1}
          </button>
        ) : 
        (index === 1 && index <= (currentPageNo - (withPage + 1)))
            // 7 === 3+3 && && 4 <= 7
            || (index === currentPageNo + (withPage + 1) && (currentPageNo + 1) <= index) ? (
          <span key={index} className="border border-gray-200 w-10 text-center">
            ...
          </span>
        ) : null
      ))}
    </div>
  )
}

export default PagingControl
