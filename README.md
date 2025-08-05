# MIPT Frontend - Industrial Practical Training Report System

A modern, mobile-first React application for managing Industrial Practical Training (MIPT) reports. Built with TypeScript, Tailwind CSS, and integrated with a Django backend.

## 🚀 Features

### Core Functionality
- **Authentication System** - Secure login/register with JWT tokens
- **Dashboard** - Overview of training progress and statistics
- **Daily Reports** - Track daily activities and learning outcomes
- **Weekly Reports** - Comprehensive weekly summaries
- **General Report** - Complete training report with multiple sections
- **Profile Management** - Student and supervisor information
- **Company Management** - Training company details and contacts

### Modern UI/UX
- **Responsive Design** - Mobile-first approach with desktop optimization
- **Theme Support** - Orange, Purple, and Green themes
- **Sidebar Navigation** - Modern slide-out menu for mobile
- **Loading States** - Smooth loading indicators and progress feedback
- **Error Handling** - Comprehensive error states and user feedback
- **Form Validation** - Real-time validation with helpful error messages

### Advanced Features
- **AI Enhancement** - Optional AI assistance for report content
- **Export Functionality** - PDF and DOCX export for reports
- **Auto-save** - Automatic saving of form data
- **Search & Filter** - Advanced search capabilities
- **Real-time Updates** - Live data synchronization

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom themes
- **State Management**: Zustand with persistence
- **HTTP Client**: Axios with JWT interceptors
- **Forms**: React Hook Form with validation
- **Icons**: Lucide React
- **Routing**: React Router DOM

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Django backend running on `http://localhost:8000`

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mipt-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` (or the port shown in terminal)

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=MIPT Frontend
```

### Backend API
Ensure your Django backend is running and accessible at `http://localhost:8000`. The frontend is configured to proxy API requests to this endpoint.

## 📱 Usage

### Authentication
1. Register a new account or login with existing credentials
2. Complete your profile with student information
3. Add your training company details

### Daily Reports
1. Navigate to "Daily Reports" from the sidebar
2. Click "New Entry" to create a daily report
3. Fill in the required fields:
   - Date and week number
   - Hours spent
   - Description of activities
   - Skills learned
   - Challenges faced
   - Supervisor feedback

### Weekly Reports
1. Go to "Weekly Reports" section
2. Create comprehensive weekly summaries
3. Include main job details, objectives, and learning outcomes
4. Use AI enhancement for better content

### General Report
1. Access the "General Report" page
2. Edit different sections as needed
3. Export as PDF or DOCX when complete

## 🔌 API Integration

The application integrates with the following backend endpoints:

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `POST /api/auth/token/refresh/` - Token refresh

### User Profile
- `GET /api/profile/` - Get user profile
- `PUT /api/profile/` - Update user profile
- `GET /api/dashboard/` - Get dashboard data

### Reports
- `GET /api/reports/daily/` - List daily reports
- `POST /api/reports/daily/` - Create daily report
- `GET /api/reports/weekly/` - List weekly reports
- `POST /api/reports/weekly/` - Create weekly report
- `GET /api/reports/general/` - Get general report
- `POST /api/reports/general/` - Update general report

### Companies
- `GET /api/companies/` - List companies
- `POST /api/companies/` - Create company
- `GET /api/companies/{id}/` - Get company details

### AI Enhancement
- `POST /api/ai/enhance/text/` - Enhance text content
- `POST /api/ai/enhance/daily/` - Enhance daily report
- `POST /api/ai/enhance/weekly/` - Enhance weekly report
- `POST /api/ai/enhance/general/` - Enhance general report

### Export
- `GET /api/export/daily/{id}/pdf/` - Export daily report as PDF
- `GET /api/export/weekly/{id}/pdf/` - Export weekly report as PDF
- `GET /api/export/general/pdf/` - Export general report as PDF

## 🎨 Customization

### Themes
The application supports three color themes:
- **Orange** (default) - Professional and energetic
- **Purple** - Creative and innovative
- **Green** - Growth and success

To change themes, use the settings button in the header or sidebar.

### Styling
Customize the appearance by modifying:
- `src/index.css` - Global styles and component classes
- `tailwind.config.js` - Tailwind configuration and theme colors
- Component-specific CSS classes

## 📱 Mobile Features

### Responsive Design
- Touch-friendly interface with minimum 44px touch targets
- Swipe gestures for navigation
- Optimized layouts for different screen sizes

### Mobile-Specific Features
- Slide-out sidebar navigation
- Bottom sheet modals for forms
- Pull-to-refresh functionality
- Offline indication and caching

## 🔒 Security

### Authentication
- JWT token-based authentication
- Automatic token refresh
- Secure logout with token invalidation
- Protected routes for authenticated users

### Data Protection
- HTTPS enforcement in production
- Secure API communication
- Input validation and sanitization
- XSS protection

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deployment Options
- **Vercel**: Connect your GitHub repository
- **Netlify**: Drag and drop the `dist` folder
- **AWS S3**: Upload the `dist` folder to S3 bucket
- **Docker**: Use the provided Dockerfile

## 🧪 Testing

### Run Tests
```bash
npm run test
```

### Linting
```bash
npm run lint
```

## 📊 Performance

### Optimization Features
- Code splitting and lazy loading
- Image optimization
- Progressive loading
- Smart caching strategies
- Background sync for offline functionality

### Performance Monitoring
- Bundle size analysis
- Loading time optimization
- Memory usage monitoring
- Network request optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues

**Port 3000 is in use**
- The app will automatically try port 3001 or higher
- Check the terminal output for the correct URL

**API connection errors**
- Ensure the Django backend is running on `http://localhost:8000`
- Check network connectivity
- Verify API endpoint availability

**Build errors**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version compatibility
- Verify all dependencies are installed

### Getting Help
- Check the [Issues](https://github.com/your-repo/issues) page
- Create a new issue with detailed information
- Contact the development team

## 🔄 Updates

### Version History
- **v1.0.0** - Initial release with core functionality
- **v1.1.0** - Added AI enhancement features
- **v1.2.0** - Improved mobile responsiveness
- **v1.3.0** - Enhanced export functionality

### Upcoming Features
- Real-time collaboration
- Advanced analytics dashboard
- Mobile app version
- Integration with learning management systems

---

**Built with ❤️ for Industrial Practical Training students** #   m i p t - f r o n t e n d  
 