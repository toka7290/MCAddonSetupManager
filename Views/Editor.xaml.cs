using System.Windows;
using System.Windows.Controls;

namespace MCAddonSetupManager
{
    /// <summary>
    /// Editor.xaml の相互作用ロジック
    /// </summary>
    public partial class Editor : UserControl
    {
        public Editor()
        {
            //InitializeComponent();
        }

        public static readonly DependencyProperty TextProperty = DependencyProperty.Register("Text", typeof(string), typeof(Editor), new FrameworkPropertyMetadata("設定項目"));
        public string Text
        {
            get { return (string)GetValue(TextProperty); }
            set { SetValue(TextProperty, value); }
        }

        public static readonly DependencyProperty ValueProperty = DependencyProperty.Register("Value", typeof(string), typeof(Editor), new FrameworkPropertyMetadata(string.Empty, FrameworkPropertyMetadataOptions.BindsTwoWayByDefault));
        public string Value
        {
            get { return (string)GetValue(ValueProperty); }
            set { SetValue(ValueProperty, value); }
        }
    }
}
