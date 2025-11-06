import React from "react";

const SecondFooter = () => (
    <footer className="py-3 border-top">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start mb-2 mb-md-0">
            <p className="text-muted mb-0 small">&copy; 2025 ServiceHub. All rights reserved.</p>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <p className="text-muted mb-0 small">
              Developed by{" "}
              <a 
                href="https://www.sacscomputers.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-decoration-none fw-semibold text-primary"
              >
                SACS Computers
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
);

export default SecondFooter;
